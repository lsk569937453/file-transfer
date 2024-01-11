import axios from 'axios'


export function  getBaseUrl(){
  return import.meta.env.PROD	?window.location.origin + "/api" : "http://localhost:8345/api"
}