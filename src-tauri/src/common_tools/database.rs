use crate::vojo::common_constants::MYSQL_COMMON_URL;
use crate::vojo::common_constants::POST_GRESQL_COMMON_URL;
use crate::vojo::common_constants::SQLITE_COMMON_URL;
use serde::Deserialize;
use serde::Serialize;
use serde_repr::{Deserialize_repr, Serialize_repr};
use sqlx::mysql::MySqlConnection;
use sqlx::postgres::PgConnection;
use sqlx::Connection;
use sqlx::Database;
use sqlx::SqliteConnection;
use std::fmt::{Display, Formatter};

#[derive(Serialize_repr, Deserialize_repr, Clone)]
#[repr(u8)]
pub enum DateBaseType {
    Mysql = 0,
    Sqlite = 1,
    Postgresql = 2,
}
#[derive(Deserialize, Serialize)]
pub struct TestDatabaseRequest {
    pub database_type: DateBaseType,
    pub source: TestSource,
}
#[derive(Deserialize, Serialize, Clone)]
pub enum TestSource {
    TestUrl(String),
    TestHost(TestHostStruct),
}
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TestHostStruct {
    pub host: String,
    pub database: String,
    pub user_name: String,
    pub password: String,
    pub port: i32,
}
impl Display for TestDatabaseRequest {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result<(), std::fmt::Error> {
        let url = match self.source.clone() {
            TestSource::TestUrl(url) => url,
            TestSource::TestHost(test_host_struct) => match self.database_type {
                DateBaseType::Mysql => format!(
                    "mysql://{}:{}@{}:{}/{}",
                    test_host_struct.user_name,
                    test_host_struct.password,
                    test_host_struct.host,
                    test_host_struct.port,
                    test_host_struct.database
                ),
                DateBaseType::Sqlite => format!(
                    "mysql://{}:{}@{}:{}/{}",
                    test_host_struct.user_name,
                    test_host_struct.password,
                    test_host_struct.host,
                    test_host_struct.port,
                    test_host_struct.database
                ),
                DateBaseType::Postgresql => format!(
                    "postgres://{}:{}@{}:{}/{}",
                    test_host_struct.user_name,
                    test_host_struct.password,
                    test_host_struct.host,
                    test_host_struct.port,
                    test_host_struct.database
                ),
            },
        };

        write!(f, "{}", url)
    }
}
pub async fn test_url_with_error(
    test_database_request: TestDatabaseRequest,
) -> core::result::Result<(), anyhow::Error> {
    let source_url = test_database_request.to_string();
    info!("databse request url:{}", source_url);
    match test_database_request.database_type {
        DateBaseType::Mysql => MySqlConnection::connect(&source_url).await.map(|_| ()),
        DateBaseType::Sqlite => SqliteConnection::connect(&source_url).await.map(|_| ()),
        DateBaseType::Postgresql => PgConnection::connect(&source_url).await.map(|_| ()),
    }
    .map_err(|e| anyhow!("连接数据库失败:{}", e))
}
#[test]
fn test() -> Result<(), anyhow::Error> {
    let test_database_request = TestDatabaseRequest {
        database_type: DateBaseType::Mysql,
        source: TestSource::TestUrl("mysql://root:123456@localhost:3306/test".to_string()),
    };
    let json_str = serde_json::to_string(&test_database_request)?;
    println!("{}", json_str);

    Ok(())
}
#[test]
fn test_host() -> Result<(), anyhow::Error> {
    let test_database_request = TestDatabaseRequest {
        database_type: DateBaseType::Mysql,
        source: TestSource::TestHost(TestHostStruct {
            host: "localhost".to_string(),
            database: "test".to_string(),
            user_name: "root".to_string(),
            password: "123456".to_string(),
            port: 3306,
        }),
    };
    let json_str = serde_json::to_string(&test_database_request)?;
    println!("{}", json_str);

    Ok(())
}
