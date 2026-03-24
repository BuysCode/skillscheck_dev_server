import express from 'express';
import router from './routes.js';
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT!;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
	origin: true,
	credentials: true
}))

app.use(router)

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});