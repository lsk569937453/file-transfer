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
use local_ip_address::local_ip;
use service::file_service::{download_file, get_path, get_root_path, set_root_path};
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

#[actix_web::get("/{_:.*}")]
async fn index() -> impl Responder {
    info!("request the index html");
    handle_embedded_file("index.html")
}

#[actix_web::get("/{_:.+\\.css}")]
async fn dist1(path: web::Path<String>) -> impl Responder {
    info!("request the css");

    handle_embedded_file(path.as_str())
}
#[actix_web::get("/{_:.+\\.js}")]
async fn dist2(path: web::Path<String>) -> impl Responder {
    info!("request the js");

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
    let ip = local_ip()?;
    let origin = format!("http://{}:8345", ip);
    qr2term::print_qr(&origin)?;

    info!("Listening on {}", origin);
    let sqlite_pool = init().await?;

    let _ = HttpServer::new(move || {
        let corss = Cors::permissive().supports_credentials();

        App::new()
            .wrap(middleware::Logger::default())
            .wrap(corss)
            .app_data(web::Data::new(sqlite_pool.clone()))
            .service(
                web::scope("/api")
                    .service(get_path)
                    .service(download_file)
                    .service(set_root_path)
                    .service(get_root_path),
            )
            .service(dist1)
            .service(dist2)
            .service(index)
    })
    .bind("0.0.0.0:8345")?
    .run()
    .await;
    Ok(())
}
