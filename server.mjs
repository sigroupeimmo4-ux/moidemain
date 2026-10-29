import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.dirname(new URL(import.meta.url).pathname);
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(pathname.split('/').some(segment=>segment.startsWith('.'))||!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}const data=await readFile(file);res.setHeader('Content-Type',({'html':'text/html; charset=utf-8','css':'text/css','js':'text/javascript','svg':'image/svg+xml','png':'image/png'})[file.split('.').pop()]||'application/octet-stream');res.end(data);}catch{res.writeHead(404);res.end('Page introuvable');}}).listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('moidemain démarré sur le port '+(process.env.PORT||3000)));
