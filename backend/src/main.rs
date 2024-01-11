use rust_embed::RustEmbed;
mod service;

mod vojo;
#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;
use axum::{
    extract::DefaultBodyLimit,
    http::{header, StatusCode, Uri},
    response::{Html, IntoResponse, Response},
    routing::{get, post, put, Router},
};
use local_ip_address::local_ip;
use service::file_service::{download_file, get_path, get_root_path, set_root_path, upload_file};
use service::sqlite::init;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

#[derive(RustEmbed)]
#[folder = "public"]
struct Asset;

#[tokio::main]
async fn main() {
    let res = main_with_error2().await;
    if let Err(e) = res {
        println!("{:?}", e);
    }
}

async fn main_with_error2() -> Result<(), anyhow::Error> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    let sqlite_pool = init().await?;
    let ip = local_ip()?;
    let origin = format!("http://{}:8345", ip);
    qr2term::print_qr(&origin)?;
    info!("Listening on {}", origin);

    let api_routes = Router::new()
        .nest("/path", Router::new().route("/", get(get_path)))
        .nest("/rootPath", Router::new().route("/", get(get_root_path)))
        .nest("/root_path", Router::new().route("/", put(set_root_path)))
        .nest("/download", Router::new().route("/", get(download_file)))
        .nest("/upload", Router::new().route("/", post(upload_file)));

    let app = Router::new()
        .nest("/api", api_routes)
        .route("/assets/*key", get(static_handler))
        .route("/", get(index_handler))
        .route("/downloadPage", get(index_handler))
        .route("/uploadPage", get(index_handler))
        .route("/settingPage", get(index_handler))
        .fallback_service(get(not_found))
        .layer(CorsLayer::permissive().allow_methods(Any))
        .layer(DefaultBodyLimit::max(
            1024 * 1024 * 1024 * 1024 * 1024 * 1024,
        ))
        .with_state(sqlite_pool);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8345));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
    Ok(())
}
async fn index_handler() -> impl IntoResponse {
    static_handler("/index.html".parse::<Uri>().unwrap()).await
}

async fn static_handler(uri: Uri) -> impl IntoResponse {
    let mut path = uri.path().trim_start_matches('/').to_string();

    if path.starts_with("dist/") {
        path = path.replace("dist/", "");
    }

    StaticFile(path)
}

// Finally, we use a fallback route for anything that didn't match.
async fn not_found() -> Html<&'static str> {
    Html("<h1>404</h1><p>Not Found</p>")
}
pub struct StaticFile<T>(pub T);

impl<T> IntoResponse for StaticFile<T>
where
    T: Into<String>,
{
    fn into_response(self) -> Response {
        let path = self.0.into();

        match Asset::get(path.as_str()) {
            Some(content) => {
                let mime = mime_guess::from_path(path).first_or_octet_stream();
                ([(header::CONTENT_TYPE, mime.as_ref())], content.data).into_response()
            }
            None => (StatusCode::NOT_FOUND, "404 Not Found").into_response(),
        }
    }
}
