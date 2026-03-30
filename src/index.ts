import express from 'express';
import router from './routes';
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
	origin: true,
	credentials: true
}))

app.use(router)

export default app;

// For local development
if (require.main === module) {
	app.listen(port, () => {
		console.log(`Server is running on http://localhost:${port}`);
	});
}