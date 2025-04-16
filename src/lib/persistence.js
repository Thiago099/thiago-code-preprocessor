class Persistence{
    static save(content, filename){
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    static load(extension){
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = extension;
        
            input.onchange = () => {
              const file = input.files[0];
              if (!file) return;
        
              const reader = new FileReader();
              reader.onload = () => {
                try {
                    resolve(reader.result);
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
}

export { Persistence }