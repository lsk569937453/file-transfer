use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer, Responder};
use mime_guess::from_path;
use rust_embed::RustEmbed;
mod service;

mod vojo;
#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;
use actix_cors::Cors;
use service::file_service::{get_path, set_root_path};
use service::sqlite::init;
#[derive(RustEmbed)]
#[folder = "public"]
struct Asset;

fn handle_embedded_file(path: &str) -> HttpResponse {
    match Asset::get(path) {
        Some(content) => HttpResponse::Ok()
            .content_type(from_path(path).first_or_octet_stream().as_ref())
            .body(content.data.into_owned()),
        None => HttpResponse::NotFound().body("404 Not Found"),
    }
}

#[actix_web::get("/")]
async fn index() -> impl Responder {
    handle_embedded_file("index.html")
}

#[actix_web::get("/{_:.*}")]
async fn dist(path: web::Path<String>) -> impl Responder {
    handle_embedded_file(path.as_str())
}

#[actix_web::main]
async fn main() {
    let res = main_with_error().await;
    if let Err(e) = res {
        println!("{:?}", e);
    }
}
async fn main_with_error() -> Result<(), anyhow::Error> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    info!("Listening on http://127.0.0.1:8000");
    let sqlite_pool = init().await?;

    let _ = HttpServer::new(move || {
        let corss = Cors::permissive().supports_credentials();

        App::new()
            .wrap(middleware::Logger::default())
            .wrap(corss)
            .app_data(web::Data::new(sqlite_pool.clone()))
            .service(web::scope("/api").service(get_path).service(set_root_path))
            .service(index)
            .service(dist)
    })
    .bind("127.0.0.1:8000")?
    .run()
    .await;
    Ok(())
}
