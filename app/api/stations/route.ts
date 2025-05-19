import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function GET() {
  try {
    // Path to the CSV file
    const filePath = path.join(process.cwd(), 'components', 'listrapidklrail', 'allstation.csv');
    
    // Read the CSV file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    // Return the stations data
    return NextResponse.json({ stations: records });
  } catch (error) {
    console.error('Error reading station data:', error);
    return NextResponse.json({ error: 'Failed to load station data' }, { status: 500 });
  }
}