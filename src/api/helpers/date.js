// Requirements
import moment from 'moment';


// Exported
export const nowDateTime = () => moment().utc().format('YYYY-MM-DD HH:mm:ss');


export const xMonthsFromNow = m => new Date(moment().utc().add(m, 'month').unix() * 1000);


export const xMonthsFromNowDateTime = m => moment().utc().add(m, 'month').format('YYYY-MM-DD HH:mm:ss');
