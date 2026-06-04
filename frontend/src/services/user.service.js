import { apiJson } from './client.service';

export function getUserProfile() {
  return apiJson('/user/profile');
}

export function getUserDashboard() {
  return apiJson('/user/dashboard');
}

export function getLivePrices(city = 'Mumbai') {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  return apiJson(`/prices${query}`);
}

export function getMaterialCategories() {
  return apiJson('/categories');
}
