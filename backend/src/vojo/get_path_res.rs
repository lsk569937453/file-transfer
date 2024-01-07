use serde::Deserialize;
use serde::Serialize;
#[derive(Serialize, Deserialize, Clone)]
pub struct GetPathRes {
    pub file_list: Vec<FileInfo>,
}
#[derive(Serialize, Deserialize, Clone)]

pub struct FileInfo {
    pub file_name: String,
    pub is_dir: bool,
    pub update_time: String,
    pub size: String,
}
