import { connect } from 'mongoose';
const connectDB = async () => {
  try {
    const conn = await connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};
export default connectDB;