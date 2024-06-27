use sqlx::migrate::MigrateDatabase;
use sqlx::sqlite::SqliteConnection;
use sqlx::sqlite::SqlitePool;
use sqlx::Connection;
use sqlx::Executor;
use sqlx::Pool;
use sqlx::Sqlite;

pub async fn init() -> Result<Pool<Sqlite>, anyhow::Error> {
    let file_path = dirs::home_dir()
        .ok_or(anyhow!("failed to get home directory"))?
        .join(".file_transfer.db");

    let db_path = file_path.to_str().ok_or(anyhow!("failed to get db path"))?;
    if Sqlite::database_exists(db_path).await? {
        let sqlite_pool = SqlitePool::connect(db_path).await?;

        return Ok(sqlite_pool);
    }

    Sqlite::create_database(db_path).await?;
    let mut connection = SqliteConnection::connect(db_path).await?;
    let _ = connection
        .execute(
            "CREATE TABLE IF NOT EXISTS config (
        id   INTEGER PRIMARY KEY AUTOINCREMENT, 
        config_key TEXT NOT NULL, 
        config_value TEXT NOT NULL
        )",
        )
        .await;
    let default_path = if cfg!(windows) { "C:\\" } else { "/" };
    println!("default path is {}", default_path);
    let insert_query = format!(
        "insert  into config (config_key, config_value) values ('config_root_path', '{}')",
        default_path
    );
    println!("insert query is {}", insert_query);
    let _ = connection.execute(insert_query.as_str()).await;
    let sqlite_pool = SqlitePool::connect(db_path).await?;
    Ok(sqlite_pool)
}
