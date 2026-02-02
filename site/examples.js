// Load examples from CSV and populate subpages
async function loadExamplesFromCSV() {
  try {
    const response = await fetch('/examples.csv');
    const csv = await response.text();
    
    // Parse CSV
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        english: values[0],
        tovian: values[1],
        ipa: values[2],
        category: values[3]
      };
    });
    
    // Group by category
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.category]) {
        grouped[row.category] = [];
      }
      grouped[row.category].push(row);
    });
    
    return { rows, grouped, categories: Object.keys(grouped) };
  } catch (error) {
    console.error('Error loading examples CSV:', error);
    return null;
  }
}

// For dynamically populating page content
window.loadExamplesFromCSV = loadExamplesFromCSV;
