use core::fmt;
#[derive(Debug)]
pub struct CommonError {
    err: anyhow::Error,
}
// impl actix_web::error::ResponseError for CommonError {
//     fn status_code(&self) -> actix_web::http::StatusCode {
//         actix_web::http::StatusCode::INTERNAL_SERVER_ERROR
//     }
//     fn error_response(&self) -> actix_web::HttpResponse<actix_web::body::BoxBody> {
//         actix_web::HttpResponse::InternalServerError().body(self.err.to_string())
//     }
// }
// impl From<anyhow::Error> for CommonError {
//     fn from(err: anyhow::Error) -> CommonError {
//         CommonError { err }
//     }
// }
// impl fmt::Display for CommonError {
//     fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
//         write!(f, "{}", self.err)
//     }
// }
