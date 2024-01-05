use chrono::DateTime;
use chrono::Datelike;
use chrono::Local;
use chrono::Timelike;
use chrono::Utc;
use core::fmt;
use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;
use std::collections::HashSet;
use std::path::Path;
use std::time::Duration;
use tauri::State;
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GitBaseInfo {
    pub project_name: String,
    pub generate_time: String,
    pub age: i32,
    pub active_days: i32,
    pub total_files: i32,
    pub total_lines: i32,
    pub total_added: i32,
    pub total_deleted: i32,
    pub total_commits: i32,
    pub authors: i32,
}
impl GitBaseInfo {
    pub fn new() -> Self {
        Self {
            project_name: "".to_string(),
            generate_time: "".to_string(),
            age: 0,
            active_days: 0,
            total_files: 0,
            total_lines: 0,
            total_added: 0,
            total_deleted: 0,
            total_commits: 0,
            authors: 0,
        }
    }
}
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RecentWeeksCommit {
    pub commits_map: HashMap<i32, i32>,
}
#[derive(Serialize, Deserialize, Clone, Debug)]

pub struct HoursOfDayCommit {
    pub commits_map: HashMap<i32, i32>,
}
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DayOfWeekCommit {
    pub commits_map: HashMap<i32, i32>,
}
#[derive(Serialize, Deserialize, Clone, Debug)]

pub struct MonthOfYearCommit {
    pub commits_map: HashMap<i32, i32>,
}
#[derive(Serialize, Deserialize, Clone, Debug)]

pub struct YearAndMonthCommit {
    pub commits_map: HashMap<String, i32>,
}
#[derive(Serialize, Deserialize, Clone, Debug)]

pub struct YearCommit {
    pub commits_map: HashMap<i32, i32>,
}
#[derive(Serialize, Deserialize, Clone)]
pub struct CommmitInfo {
    pub recent_weeks_commit: RecentWeeksCommit,
    pub hours_commit: HoursOfDayCommit,
    pub day_of_week_commit: DayOfWeekCommit,
    pub month_of_year_commit: MonthOfYearCommit,
    pub year_and_month_commit: YearAndMonthCommit,
    pub year_commit: YearCommit,
}
// #[derive(Serialize, Deserialize, Clone, Eq, PartialEq)]
// pub struct AuthorStatisticInfoItem {
//     pub author_name: String,
//     pub total_commit: i32,
//     pub total_added: i32,
//     pub total_deleted: i32,
//     pub first_commit: String,
//     pub last_commit: String,
//     pub age: String,
//     pub active_days: i32,
// }
#[derive(Serialize, Deserialize, Clone)]
pub struct TotalAuthorStatisticInfoItem {
    pub author_name: String,
    pub total_commit: i32,
    pub total_added: i32,
    pub total_deleted: i32,
    pub first_commit: String,
    pub last_commit: String,
    pub age: i32,
    pub active_days: i32,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TotalAuthorStatisticInfo {
    pub total_authors: HashMap<String, TotalAuthorStatisticInfoItem>,
}
#[derive(Serialize, Deserialize, Clone)]
pub struct AuthorOfMonthStatisticInfo {
    pub authors_map: HashMap<String, HashMap<String, AuthorStatisticInfoItem>>,
}
#[derive(Serialize, Deserialize, Clone)]
pub struct AuthorOfYearStatisticInfo {
    pub authors_map: HashMap<String, HashMap<String, AuthorStatisticInfoItem>>,
}
#[derive(Serialize, Deserialize, Clone)]
pub struct AuthorStatisticInfoItem {
    pub author: String,
    pub commit: i32,
}

#[derive(Serialize, Deserialize, Clone)]

pub struct AuthorStatisticInfo {
    pub total_author_statistic_info: TotalAuthorStatisticInfo,
    pub author_of_month_statistic_info: AuthorOfMonthStatisticInfo,
    pub author_of_year_statistic_info: AuthorOfYearStatisticInfo,
}
#[derive(Serialize, Deserialize, Clone)]

pub struct GitStatisticInfo {
    pub git_base_info: GitBaseInfo,
    pub commit_info: CommmitInfo,
    pub author_statistic_info: AuthorStatisticInfo,
}
impl GitStatisticInfo {
    pub fn new() -> Self {
        Self {
            git_base_info: GitBaseInfo::new(),
            commit_info: CommmitInfo {
                recent_weeks_commit: RecentWeeksCommit {
                    commits_map: HashMap::new(),
                },
                hours_commit: HoursOfDayCommit {
                    commits_map: HashMap::new(),
                },
                day_of_week_commit: DayOfWeekCommit {
                    commits_map: HashMap::new(),
                },
                month_of_year_commit: MonthOfYearCommit {
                    commits_map: HashMap::new(),
                },
                year_and_month_commit: YearAndMonthCommit {
                    commits_map: HashMap::new(),
                },
                year_commit: YearCommit {
                    commits_map: HashMap::new(),
                },
            },
            author_statistic_info: AuthorStatisticInfo {
                total_author_statistic_info: TotalAuthorStatisticInfo {
                    total_authors: HashMap::new(),
                },
                author_of_month_statistic_info: AuthorOfMonthStatisticInfo {
                    authors_map: HashMap::new(),
                },
                author_of_year_statistic_info: AuthorOfYearStatisticInfo {
                    authors_map: HashMap::new(),
                },
            },
        }
    }
    pub fn calc_commit(
        &mut self,
        time: DateTime<Local>,
        author: String,
        total_added: i32,
        total_deleted: i32,
    ) {
        self.calc_recent_week_commits(time);
        self.calc_hours_commit(time);
        self.calc_day_of_week_commit(time);
        self.calc_month_of_year_commit(time);
        self.calc_year_and_month_commit(time);
        self.calc_year_commit(time);

        self.calc_total_authors(time, author.clone(), total_added, total_deleted);
        self.calc_month_of_year_authors(time, author.clone());
        self.calc_year_authors(time, author);
    }
    fn calc_recent_week_commits(&mut self, time: DateTime<Local>) {
        let now = Local::now();
        let duration = now - time;
        let week = duration.num_weeks() as i32;
        if week < 0 || week > 32 {
            return;
        }

        let commit_map = &mut self.commit_info.recent_weeks_commit.commits_map;
        match commit_map.entry(week) {
            std::collections::hash_map::Entry::Occupied(mut e) => {
                let data = *e.get();
                e.insert(data + 1);
            }
            std::collections::hash_map::Entry::Vacant(e) => {
                e.insert(1);
            }
        }
    }
    fn calc_hours_commit(&mut self, time: DateTime<Local>) {
        let hour = time.hour() as i32;
        let commit_map = &mut self.commit_info.hours_commit.commits_map;
        match commit_map.entry(hour) {
            std::collections::hash_map::Entry::Occupied(mut e) => {
                let data = *e.get();
                e.insert(data + 1);
            }
            std::collections::hash_map::Entry::Vacant(e) => {
                e.insert(1);
            }
        }
    }
    fn calc_day_of_week_commit(&mut self, time: DateTime<Local>) {
        let day_of_week = time.date_naive().weekday().number_from_monday() as i32;
        let commit_map = &mut self.commit_info.day_of_week_commit.commits_map;
        match commit_map.entry(day_of_week) {
            std::collections::hash_map::Entry::Occupied(mut e) => {
                let data = *e.get();
                e.insert(data + 1);
            }
            std::collections::hash_map::Entry::Vacant(e) => {
                e.insert(1);
            }
        }
    }
    fn calc_month_of_year_commit(&mut self, time: DateTime<Local>) {
        let month = time.month() as i32;
        let commit_map = &mut self.commit_info.month_of_year_commit.commits_map;
        match commit_map.entry(month) {
            std::collections::hash_map::Entry::Occupied(mut e) => {
                let data = *e.get();
                e.insert(data + 1);
            }
            std::collections::hash_map::Entry::Vacant(e) => {
                e.insert(1);
            }
        }
    }
    fn calc_year_and_month_commit(&mut self, time: DateTime<Local>) {
        let year_and_month = time.format("%Y-%m").to_string();
        let commit_map = &mut self.commit_info.year_and_month_commit.commits_map;
        match commit_map.entry(year_and_month) {
            std::collections::hash_map::Entry::Occupied(mut e) => {
                let data = *e.get();
                e.insert(data + 1);
            }
            std::collections::hash_map::Entry::Vacant(e) => {
                e.insert(1);
            }
        }
    }
    fn calc_year_commit(&mut self, time: DateTime<Local>) {
        let year = time.year();
        let commit_map = &mut self.commit_info.year_commit.commits_map;
        match commit_map.entry(year) {
            std::collections::hash_map::Entry::Occupied(mut e) => {
                let data = *e.get();
                e.insert(data + 1);
            }
            std::collections::hash_map::Entry::Vacant(e) => {
                e.insert(1);
            }
        }
    }
    fn calc_total_authors(
        &mut self,
        time: DateTime<Local>,
        author: String,
        total_added: i32,
        total_deleted: i32,
    ) {
        let author_hashmap = &mut self
            .author_statistic_info
            .total_author_statistic_info
            .total_authors;

        let commit_time = time.format("%Y-%m-%d").to_string();
        match author_hashmap.entry(author.clone()) {
            std::collections::hash_map::Entry::Occupied(mut e) => {
                let data = e.get_mut();
                data.last_commit = commit_time;
                data.total_commit += 1;
                data.total_added += total_added;
                data.total_deleted += total_deleted;
                data.active_days += 1;
                // e.insert(data.clone());
            }
            std::collections::hash_map::Entry::Vacant(e) => {
                let now = Utc::now();
                let age = now.signed_duration_since(time);
                let item = TotalAuthorStatisticInfoItem {
                    author_name: author,
                    total_commit: 1,
                    total_added,
                    total_deleted,
                    first_commit: commit_time.clone(),
                    last_commit: commit_time,
                    age: age.num_days() as i32,
                    active_days: 1,
                };
                e.insert(item);
            }
        }
    }
    fn calc_month_of_year_authors(&mut self, time: DateTime<Local>, author: String) {
        let author_hashmap = &mut self
            .author_statistic_info
            .author_of_month_statistic_info
            .authors_map;
        let data_str = time.format("%Y-%m").to_string();
        match author_hashmap.entry(data_str.clone()) {
            std::collections::hash_map::Entry::Occupied(mut e) => {
                let map_value = e.get_mut();
                map_value
                    .entry(author.clone())
                    .or_insert(AuthorStatisticInfoItem {
                        author: author.clone(),
                        commit: 0,
                    })
                    .commit += 1;
            }
            std::collections::hash_map::Entry::Vacant(e) => {
                let mut hash_map = HashMap::new();
                hash_map.insert(
                    author.clone(),
                    AuthorStatisticInfoItem { author, commit: 1 },
                );
                e.insert(hash_map);
            }
        }
    }
    fn calc_year_authors(&mut self, time: DateTime<Local>, author: String) {
        let author_hashmap = &mut self
            .author_statistic_info
            .author_of_year_statistic_info
            .authors_map;
        let data_str = time.format("%Y").to_string();
        match author_hashmap.entry(data_str.clone()) {
            std::collections::hash_map::Entry::Occupied(mut e) => {
                let map_value = e.get_mut();
                map_value
                    .entry(author.clone())
                    .or_insert(AuthorStatisticInfoItem {
                        author: author.clone(),
                        commit: 0,
                    })
                    .commit += 1;
            }
            std::collections::hash_map::Entry::Vacant(e) => {
                let mut hash_map = HashMap::new();
                hash_map.insert(
                    author.clone(),
                    AuthorStatisticInfoItem { author, commit: 1 },
                );
                e.insert(hash_map);
            }
        }
    }
}
impl fmt::Display for GitStatisticInfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", serde_json::to_string(self).unwrap())
    }
}
