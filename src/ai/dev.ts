import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

// Flows will be imported for their side effects in this file.
import './flows/analyze-scam-flow';
import './flows/voice-warning-flow';
import './flows/ocr-flow';
import './flows/target-analysis-flow';
import './flows/scam-simulator-flow';
