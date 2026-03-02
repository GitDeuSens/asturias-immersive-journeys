const { createReadStream } = require('fs');
const { parseFile } = require('music-metadata');
const axios = require('axios');

// Directus API configuration
const DIRECTUS_URL = 'https://back.asturias.digitalmetaverso.com';
const STATIC_TOKEN = 'asturias-creator-hub-admin-2024';

// Helper function to get file URL
function getFileUrl(fileId) {
  return `${DIRECTUS_URL}/assets/${fileId}`;
}

// Helper function to make API requests
async function makeRequest(endpoint, method = 'GET', data = null) {
  const config = {
    method,
    url: `${DIRECTUS_URL}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${STATIC_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

// Main function to update existing audio files
async function updateExistingAudioFiles() {
  console.log('Starting update of existing audio files...');
  
  try {
    // Get all audio files without duration
    const files = await makeRequest('/files?filter[type][_starts_with]=audio&filter[duration][_null]=true&limit=-1');
    console.log(`Found ${files.data.length} audio files without duration`);
    
    for (const file of files.data) {
      console.log(`\nProcessing file: ${file.filename_download} (${file.id})`);
      
      try {
        // Download file
        const fileUrl = getFileUrl(file.id);
        const response = await axios.get(fileUrl, { responseType: 'stream' });
        const chunks = [];
        
        for await (const chunk of response.data) {
          chunks.push(chunk);
        }
        
        const buffer = Buffer.concat(chunks);
        
        // Extract metadata
        const metadata = await parseFile(buffer);
        
        if (metadata.format.duration) {
          const duration = Math.round(metadata.format.duration);
          
          // Update file duration
          await makeRequest(`/files/${file.id}`, 'PATCH', {
            duration: duration
          });
          
          console.log(`  ✓ Updated duration: ${duration}s`);
          
          // Find and update related POIs
          const pois = await makeRequest(`/items/pois?filter[_or][audio_es][_eq]=${file.id}&filter[_or][audio_en][_eq]=${file.id}&filter[_or][audio_fr][_eq]=${file.id}`);
          
          for (const poi of pois.data) {
            await makeRequest(`/items/pois/${poi.id}`, 'PATCH', {
              audio_duration_seconds: duration
            });
            console.log(`  ✓ Updated POI: ${poi.id}`);
          }
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          console.log(`  ⚠ No duration found in metadata`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing file ${file.id}:`, error.message);
      }
    }
    
    console.log('\n✅ Update completed!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
updateExistingAudioFiles();
