import { createDirectus, rest, authentication, readFiles } from '@directus/sdk';
import dotenv from 'dotenv';
dotenv.config();
const d = createDirectus(process.env.PUBLIC_URL).with(authentication()).with(rest());
await d.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
const files = await d.request(readFiles({ fields: ['id','title','type','filename_download'], limit: -1 }));
console.log(JSON.stringify(files.map(f => ({id:f.id, title:f.title, type:f.type, fn:f.filename_download})), null, 2));
