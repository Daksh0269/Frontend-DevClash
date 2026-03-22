import { Client, Account, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1') // Default Appwrite cloud URL
    .setProject('69b1ba94000432d71f95'); // ⚠️ Replace this with your actual Project ID

export const account = new Account(client);
export { ID };