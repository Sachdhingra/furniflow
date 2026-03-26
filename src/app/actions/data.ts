'use server';

import { getUsers, getCustomers, getJobs, getNotifications } from './db';
import { seedDatabase } from './seed';

export async function getInitialData() {
  const users = await getUsers();
  if (users.length === 0) {
    await seedDatabase();
  }
  
  const [usersData, customers, jobs] = await Promise.all([
    getUsers(),
    getCustomers(),
    getJobs(),
  ]);

  return { users: usersData, customers, jobs };
}

export async function getUserNotifications(userId: string) {
  return await getNotifications(userId);
}
