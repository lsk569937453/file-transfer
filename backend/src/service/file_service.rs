use std::path::Path;
use std::path::PathBuf;
use std::vec;

use crate::vojo::base_response::BaseResponse;
use crate::vojo::get_path_res::FileInfo;
use actix_web::HttpRequest;
use actix_web::{error, get, put, web, App, HttpResponse, HttpServer, Responder};
use chrono::offset::Utc;
use chrono::DateTime;
use human_bytes::human_bytes;
use serde_derive::Deserialize;
use sqlx::Pool;
use sqlx::Row;
use sqlx::{Sqlite, SqliteConnection};
use tokio::fs::File;
use tokio::{
    self,
    io::{AsyncReadExt, AsyncSeekExt},
    runtime,
};
#[derive(Debug, Deserialize)]
pub struct Params {
    path: String,
}

#[get("/path")]
pub async fn get_path(
    req: HttpRequest,
    conn: web::Data<Pool<Sqlite>>,
) -> Result<String, actix_web::Error> {
    info!("req: {:?}", req.query_string());

    let res = get_path_with_error(conn, req).await;
    let data = match res {
        Ok(r) => {
            let res = BaseResponse {
                response_code: 0,
                response_msg: r,
            };
            serde_json::to_string(&res)
        }
        Err(e) => {
            let res = BaseResponse {
                response_code: 1,
                response_msg: e.to_string(),
            };
            serde_json::to_string(&res)
        }
    }?;
    Ok(data)
}
async fn get_path_with_error(
    conn: web::Data<Pool<Sqlite>>,
    req: HttpRequest,
) -> Result<Vec<FileInfo>, anyhow::Error> {
    let query_result = web::Query::<Params>::from_query(req.query_string());
    let web_path = match query_result {
        Ok(r) => r.path.to_string(),
        Err(e) => String::from(""),
    };
    info!("webpath is {}", web_path);
    let sqlite_row = sqlx::query(
        "
    select *from config",
    )
    .fetch_one(conn.as_ref())
    .await?;
    let config_root_path = sqlite_row.get::<String, _>("config_value");
    let web_path_items = web_path.split(',').collect::<PathBuf>();
    let final_path = PathBuf::new().join(config_root_path).join(web_path_items);
    let mut files_in_dir = tokio::fs::read_dir(&final_path).await?;
    let mut files = vec![];
    while let Some(entry) = files_in_dir.next_entry().await? {
        let meta_data = entry.metadata().await?;
        let size = human_bytes(meta_data.len() as u32);
        let modified_time: DateTime<Utc> = meta_data.modified()?.into();
        let file_info = FileInfo {
            file_name: entry
                .file_name()
                .to_str()
                .ok_or(anyhow!("failed to get file name"))?
                .to_string(),
            is_dir: entry.file_type().await?.is_dir(),
            size,
            update_time: modified_time.format("%Y-%m-%d %H:%M:%S").to_string(),
        };
        files.push(file_info);
    }
    Ok(files)
}
#[put("/root_path")]
pub async fn set_root_path(
    conn: web::Data<Pool<Sqlite>>,
    req: HttpRequest,
) -> Result<String, actix_web::Error> {
    let res = set_root_path_with_error(conn, req).await;
    let res = match res {
        Ok(()) => {
            let base_res = BaseResponse {
                response_code: 0,
                response_msg: String::from(""),
            };
            serde_json::to_string(&base_res)
        }
        Err(e) => {
            let base_res = BaseResponse {
                response_code: 1,
                response_msg: e.to_string(),
            };
            serde_json::to_string(&base_res)
        }
    }?;
    Ok(res)
}

async fn set_root_path_with_error(
    conn: web::Data<Pool<Sqlite>>,
    req: HttpRequest,
) -> Result<(), anyhow::Error> {
    let params = web::Query::<Params>::from_query(req.query_string())?;
    let root_path = &params.path;
    let _ = sqlx::query("delete from config")
        .execute(conn.as_ref())
        .await?;
    let _ = sqlx::query(
        "insert  into config (config_key, config_value) values ('config_root_path', $1)",
    )
    .bind(root_path.to_string())
    .execute(conn.as_ref())
    .await?;
    Ok(())
}
