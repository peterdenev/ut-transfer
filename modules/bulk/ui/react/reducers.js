import {bulkBatchToolbox} from './containers/Batch/GridToolbox/reducer';
import {bulkPaymentToolbox} from './containers/Payment/GridToolbox/reducer';
import {bulkBatchFilterStatus} from './containers/Batch/Filters/ByStatus/reducer';
import {bulkBatchFilterDate} from './containers/Batch/Filters/ByDate/reducer';
import {bulkBatchFilterName} from './containers/Batch/Filters/ByName/reducer';
import {bulkPaymentGrid} from './containers/Payment/Grid/reducer';
import {bulkPaymentFilterDate} from './containers/Payment/Filters/ByDate/reducer';
import {bulkPaymentFilterStatus} from './containers/Payment/Filters/ByStatus/reducer';
import {bulkPaymentFilterCustom} from './containers/Payment/Filters/ByCustom/reducer';
import {bulkBatchGrid} from './containers/Batch/Grid/reducer';
import {bulkBatchDetailEditPopup} from './containers/Batch/Popups/Details/reducer';
import {bulkPaymentDetailEditPopup} from './containers/Payment/Popups/Details/reducer';
import {bulkBatchPayPopup} from './containers/Batch/Popups/Pay/reducer';
import {bulkBatchDisablePopup} from './containers/Batch/Popups/DisableBatch/reducer';
import {bulkBatchRejectPopup} from './containers/Batch/Popups/RejectBatch/reducer';
import {bulkBatchDeletePopup} from './containers/Batch/Popups/DeleteBatch/reducer';

/**
 * Todo: don't forget to add reducers here
 */
export default {
    bulkBatchToolbox,
    bulkPaymentToolbox,
    bulkBatchFilterStatus,
    bulkBatchFilterDate,
    bulkBatchFilterName,
    bulkPaymentGrid,
    bulkPaymentFilterDate,
    bulkPaymentFilterStatus,
    bulkPaymentFilterCustom,
    bulkBatchGrid,
    bulkBatchDetailEditPopup,
    bulkPaymentDetailEditPopup,
    bulkBatchPayPopup,
    bulkBatchDisablePopup,
    bulkBatchRejectPopup,
    bulkBatchDeletePopup
};
