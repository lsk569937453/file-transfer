use crate::vojo::base_response::BaseResponse;
use crate::vojo::common_error::CommonError;
use crate::vojo::get_path_res::FileInfo;
use actix_files::NamedFile;
use actix_multipart::{
    form::{
        tempfile::{TempFile, TempFileConfig},
        MultipartForm,
    },
    Multipart,
};
use actix_web::error::DispatchError::InternalError;
use actix_web::http::Error;
use actix_web::HttpRequest;
use actix_web::{error, get, post, put, web, App, HttpResponse, HttpServer, Responder};
use chrono::offset::Utc;
use chrono::DateTime;
use human_bytes::human_bytes;
use serde_derive::Deserialize;
use sqlx::Pool;
use sqlx::Row;
use sqlx::{Sqlite, SqliteConnection};
use std::path::Path;
use std::path::PathBuf;
use std::vec;
use tokio::fs::File;
use tokio::fs::File as TokioFile;
use tokio::{
    self,
    io::{AsyncReadExt, AsyncSeekExt},
    runtime,
};

#[derive(Debug, Deserialize)]
pub struct Params {
    path: String,
}
#[derive(Debug, MultipartForm)]
struct UploadForm {
    #[multipart(rename = "file")]
    files: Vec<TempFile>,
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
    let sqlite_row = sqlx::query("select *from config")
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
    req: web::Json<Params>,
) -> Result<String, actix_web::Error> {
    let res = set_root_path_with_error(conn, req.path.clone()).await;
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
    path: String,
) -> Result<(), anyhow::Error> {
    let root_path = path;
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
#[get("/download")]
pub async fn download_file(
    req: HttpRequest,
    conn: web::Data<Pool<Sqlite>>,
) -> Result<HttpResponse, actix_web::Error> {
    info!("req: {:?}", req.query_string());

    let res = download_file_with_error(conn, req)
        .await
        .map_err(|e| CommonError::from(e))?;

    Ok(res)
}
async fn download_file_with_error(
    conn: web::Data<Pool<Sqlite>>,
    req: HttpRequest,
) -> Result<HttpResponse, anyhow::Error> {
    let query_result = web::Query::<Params>::from_query(req.query_string())?;
    let web_path_items = query_result.path.split(",").collect::<PathBuf>();
    let sqlite_row = sqlx::query("select *from config")
        .fetch_one(conn.as_ref())
        .await?;
    let config_root_path = sqlite_row.get::<String, _>("config_value");
    let final_path = PathBuf::new().join(config_root_path).join(web_path_items);
    let istream = NamedFile::open_async(final_path).await?;
    let res = istream.into_response(&req);
    Ok(res)
}
#[get("/rootPath")]
pub async fn get_root_path(
    req: HttpRequest,
    conn: web::Data<Pool<Sqlite>>,
) -> Result<String, actix_web::Error> {
    info!("req: {:?}", req.query_string());

    let res = get_root_path_with_error(conn).await;
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
async fn get_root_path_with_error(conn: web::Data<Pool<Sqlite>>) -> Result<String, anyhow::Error> {
    let sqlite_row = sqlx::query("select *from config")
        .fetch_one(conn.as_ref())
        .await?;
    let config_root_path = sqlite_row.get::<String, _>("config_value");
    Ok(config_root_path)
}
#[post("/upload")]
pub async fn upload_file(
    MultipartForm(form): MultipartForm<UploadForm>,
    conn: web::Data<Pool<Sqlite>>,
) -> Result<impl Responder, actix_web::Error> {
    let res = upload_file_with_error(form, conn)
        .await
        .map_err(|e| CommonError::from(e))?;

    Ok(res)
}
async fn upload_file_with_error(
    form: UploadForm,
    conn: web::Data<Pool<Sqlite>>,
) -> Result<impl Responder, anyhow::Error> {
    let sqlite_row = sqlx::query("select *from config")
        .fetch_one(conn.as_ref())
        .await?;
    let config_root_path = sqlite_row.get::<String, _>("config_value");
    for f in form.files {
        let f_name = f.file_name.ok_or(anyhow!("no file name"))?;

        let final_path = PathBuf::new().join(config_root_path.clone()).join(f_name);

        info!("saving to {:?}", final_path);
        let src = f.file.into_file();
        let mut tokio_src = TokioFile::from_std(src);
        let mut dst = tokio::fs::OpenOptions::new()
            .create(true) // To create a new file
            .write(true)
            .open(final_path)
            .await?;
        tokio::io::copy(&mut tokio_src, &mut dst).await?;
    }

    Ok(HttpResponse::Ok())
}
