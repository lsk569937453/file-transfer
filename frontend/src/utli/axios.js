import axios from 'axios'



const config = {
  baseURL: `http://localhost:8000/api`,
  params: {
    part: 'snippet',
    maxResults: 5,
  },


}
export default axios.create(config)
