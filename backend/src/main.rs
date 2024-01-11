use mime_guess::from_path;
use rust_embed::RustEmbed;
mod service;

mod vojo;
#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;
use actix_cors::Cors;
use axum::{
    http::{header, StatusCode, Uri},
    http::{HeaderValue, Method},
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

// fn handle_embedded_file(path: &str) -> HttpResponse {
//     match Asset::get(path) {
//         Some(content) => HttpResponse::Ok()
//             .content_type(from_path(path).first_or_octet_stream().as_ref())
//             .body(content.data.into_owned()),
//         None => HttpResponse::NotFound().body("404 Not Found"),
//     }
// }

// #[actix_web::get("/{_:.*}")]
// async fn index() -> impl Responder {
//     info!("request the index html");
//     handle_embedded_file("index.html")
// }

// #[actix_web::get("/{_:.+\\.css}")]
// async fn dist1(path: web::Path<String>) -> impl Responder {
//     info!("request the css");

//     handle_embedded_file(path.as_str())
// }
// #[actix_web::get("/{_:.+\\.js}")]
// async fn dist2(path: web::Path<String>) -> impl Responder {
//     info!("request the js");

//     handle_embedded_file(path.as_str())
// }
#[tokio::main]
async fn main() {
    let res = main_with_error2().await;
    if let Err(e) = res {
        println!("{:?}", e);
    }
}
// async fn main_with_error() -> Result<(), anyhow::Error> {
//     // tracing_subscriber::fmt::init();

//     env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
//     let ip = local_ip()?;
//     let origin = format!("http://{}:8345", ip);
//     qr2term::print_qr(&origin)?;

//     info!("Listening on {}", origin);
//     let sqlite_pool = init().await?;

//     let _ = HttpServer::new(move || {
//         let corss = Cors::permissive().supports_credentials();

//         App::new()
//             .wrap(middleware::Logger::default())
//             .wrap(corss)
//             .app_data(web::Data::new(sqlite_pool.clone()))
//             .service(
//                 web::scope("/api")
//                     .service(get_path)
//                     .service(download_file)
//                     .service(set_root_path)
//                     .service(get_root_path)
//                     .service(upload_file),
//             )
//             .service(dist1)
//             .service(dist2)
//             .service(index)
//     })
//     .bind("0.0.0.0:8345")?
//     .run()
//     .await;
//     Ok(())
// }
async fn main_with_error2() -> Result<(), anyhow::Error> {
    let sqlite_pool = init().await?;
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    let api_routes = Router::new()
        .nest("/path", Router::new().route("/", get(get_path)))
        .nest("/rootPath", Router::new().route("/", get(get_root_path)))
        .nest("/root_path", Router::new().route("/", put(set_root_path)))
        .nest("/download", Router::new().route("/", get(download_file)))
        .nest("/upload", Router::new().route("/", post(upload_file)));

    // Define our app routes, including a fallback option for anything not matched.
    let app = Router::new()
        .nest("/api", api_routes)
        .route("/assets/*key", get(static_handler))
        .route("/", get(index_handler))
        .route("/downloadPage", get(index_handler))
        .route("/uploadPage", get(index_handler))
        .route("/settingPage", get(index_handler))
        .fallback_service(get(not_found))
        .layer(CorsLayer::permissive().allow_methods(Any))
        .with_state(sqlite_pool);
    // Start listening on the given address.
    let addr = SocketAddr::from(([0, 0, 0, 0], 8345));
    println!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
    Ok(())
}
// page.
async fn index_handler() -> impl IntoResponse {
    static_handler("/index.html".parse::<Uri>().unwrap()).await
}

// We use a wildcard matcher ("/dist/*file") to match against everything
// within our defined assets directory. This is the directory on our Asset
// struct below, where folder = "examples/public/".
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
