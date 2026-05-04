import axios from 'axios'

// Global axios instance
const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  throw new Error('VITE_API_URL is not defined in environment variables')
}

export const api = axios.create({
  baseURL
})
