import axios from 'axios';
import { SESSION_ID } from '../../lib/api';

const sentinelApi = axios.create({
  baseURL: '/api/v1'
});

sentinelApi.interceptors.request.use(config => {
  config.headers['X-Session-ID'] = SESSION_ID;
  return config;
});

export default sentinelApi;
