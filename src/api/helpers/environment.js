// Variables
let environmentValue = null;


// Internal
const initialize = () => {
    const val = () => {
        if (process.argv.indexOf('production') !== -1) return 'production';
        return 'development';
    };
    environmentValue = val();
};

initialize();


// Exported
export const environment = environmentValue;
