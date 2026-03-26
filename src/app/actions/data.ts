'use server';

import { getUsers, getCustomers, getJobs, getNotifications } from './db';

export async function getInitialData() {
  const [users, customers, jobs] = await Promise.all([
    getUsers(),
    getCustomers(),
    getJobs(),
  ]);

  return { users, customers, jobs };
}

export async function getUserNotifications(userId: string) {
  return await getNotifications(userId);
}
