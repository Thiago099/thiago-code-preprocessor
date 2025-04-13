class Json{
    static  load() {
        return new Promise((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
      
          input.onchange = () => {
            const file = input.files[0];
            if (!file) return;
      
            const reader = new FileReader();
            reader.onload = () => {
              try {
                  const json = JSON.parse(reader.result);
                  resolve(json);
              } 
              catch
              {
                resolve(null)
              }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
          };
      
          input.click();
        });
      }

    static save(json, filename = 'data.json') {
        const jsonString = JSON.stringify(json, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
}

export { Json }