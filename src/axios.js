import axios from 'axios';

export default axios.create({

    baseURL:"http://10.22.1.33:8080/pivot_data/",
    timeout:30000
})