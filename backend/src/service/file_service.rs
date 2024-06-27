use crate::vojo::base_response::BaseResponse;
use crate::vojo::get_path_res::FileInfo;

use axum::body::Body;
use axum::{
    body::Bytes,
    extract,
    extract::Request,
    extract::{Multipart, State},
    http::StatusCode,
    response::Response,
    BoxError,
};
use std::io;

use axum::extract::Query;
use chrono::offset::Utc;
use chrono::DateTime;
use futures::Stream;
use futures::TryStreamExt;
use human_bytes::human_bytes;

use serde_derive::Deserialize;
use sqlx::Pool;
use sqlx::Row;
use sqlx::Sqlite;
use std::path::PathBuf;
use std::vec;
use tokio::fs::File;
use tokio::io::BufWriter;
use tokio::{self};
use tokio_util::io::StreamReader;
use tower_http::services::fs::ServeFileSystemResponseBody;
use tower_http::services::ServeFile;

#[derive(Debug, Deserialize)]
pub struct Params {
    path: Option<String>,
}

pub async fn get_path(
    Query(params): Query<Params>,
    State(pool): State<Pool<Sqlite>>,
) -> Result<String, (StatusCode, String)> {
    let res = get_path_with_error(pool, params).await;
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
    }
    .unwrap_or("error convert".to_string());
    Ok(data)
}
async fn get_path_with_error(
    pool: Pool<Sqlite>,
    param: Params,
) -> Result<Vec<FileInfo>, anyhow::Error> {
    let web_path = param.path.unwrap_or(String::from("/"));
    info!("webpath is {}", web_path);
    let sqlite_row = sqlx::query("select *from config").fetch_one(&pool).await?;
    let config_root_path = sqlite_row.get::<String, _>("config_value");
    let web_path_items = web_path.split(',').collect::<PathBuf>();
    let final_path = PathBuf::new().join(config_root_path).join(web_path_items);
    println!("final path is {}", final_path.display());
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
pub async fn set_root_path(
    State(pool): State<Pool<Sqlite>>,
    extract::Json(payload): extract::Json<Params>,
) -> Result<String, (StatusCode, String)> {
    let res = set_root_path_with_error(pool, payload).await;
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
    }
    .unwrap_or(String::from(""));
    Ok(res)
}

async fn set_root_path_with_error(pool: Pool<Sqlite>, param: Params) -> Result<(), anyhow::Error> {
    let root_path = param.path.ok_or(anyhow!(""))?;
    let _ = sqlx::query("delete from config").execute(&pool).await?;
    let _ = sqlx::query(
        "insert  into config (config_key, config_value) values ('config_root_path', $1)",
    )
    .bind(root_path.to_string())
    .execute(&pool)
    .await?;
    Ok(())
}
pub async fn download_file(
    Query(params): Query<Params>,
    State(pool): State<Pool<Sqlite>>,
) -> Result<Response<ServeFileSystemResponseBody>, (StatusCode, String)> {
    let result = download_file_with_error(pool, params)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(result)
}
async fn download_file_with_error(
    pool: Pool<Sqlite>,
    param: Params,
) -> Result<Response<ServeFileSystemResponseBody>, anyhow::Error> {
    let web_path_items = param.path.unwrap().split(",").collect::<PathBuf>();
    let sqlite_row = sqlx::query("select *from config").fetch_one(&pool).await?;
    let config_root_path = sqlite_row.get::<String, _>("config_value");
    let final_path = PathBuf::new().join(config_root_path).join(web_path_items);
    let req = Request::new(Body::empty());

    let ss = ServeFile::new(final_path).try_call(req).await?;

    Ok(ss)
}
pub async fn get_root_path(
    State(pool): State<Pool<Sqlite>>,
) -> Result<String, (StatusCode, String)> {
    let res = get_root_path_with_error(pool).await;
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
    }
    .unwrap_or(String::from(""));
    Ok(data)
}
async fn get_root_path_with_error(pool: Pool<Sqlite>) -> Result<String, anyhow::Error> {
    let sqlite_row = sqlx::query("select *from config").fetch_one(&pool).await?;
    let config_root_path = sqlite_row.get::<String, _>("config_value");
    Ok(config_root_path)
}
pub async fn upload_file(
    State(pool): State<Pool<Sqlite>>,
    multipart: Multipart,
) -> Result<String, (StatusCode, String)> {
    info!("upload start");
    let res = upload_file_with_error(multipart, pool).await;
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
    }
    .unwrap_or(String::from(""));
    Ok(res)
}
async fn upload_file_with_error(
    mut multipart: Multipart,
    pool: Pool<Sqlite>,
) -> Result<(), anyhow::Error> {
    let sqlite_row = sqlx::query("select *from config").fetch_one(&pool).await?;
    let config_root_path = sqlite_row.get::<String, _>("config_value");
    while let Some(field) = multipart.next_field().await? {
        let file_name = field.file_name().unwrap().to_string();
        let final_path = PathBuf::new()
            .join(config_root_path.clone())
            .join(file_name)
            .to_str()
            .unwrap()
            .to_string();
        info!("saving to {:?}", final_path);

        let _ = stream_to_file(&final_path, field)
            .await
            .map_err(|(a, b)| anyhow!("Status code is {}, message is {}", a, b))?;
    }

    Ok(())
}
async fn stream_to_file<S, E>(path: &str, stream: S) -> Result<(), (StatusCode, String)>
where
    S: Stream<Item = Result<Bytes, E>>,
    E: Into<BoxError>,
{
    async {
        let body_with_io_error = stream.map_err(|err| io::Error::new(io::ErrorKind::Other, err));
        let body_reader = StreamReader::new(body_with_io_error);
        futures::pin_mut!(body_reader);

        let mut file = BufWriter::new(File::create(path).await?);

        tokio::io::copy(&mut body_reader, &mut file).await?;

        Ok::<_, io::Error>(())
    }
    .await
    .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))
}
