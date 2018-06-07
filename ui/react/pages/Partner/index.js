import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import Header from 'ut-front-react/components/PageLayout/Header';
import { getLink } from 'ut-front/react/routerHelper';
import { AddTab } from 'ut-front-react/containers/TabMenu';
import ResizibleContainer from 'ut-front-react/components/ResiziblePageLayout/Container';
import resizibleTypes from 'ut-front-react/components/ResiziblePageLayout/resizibleTypes';
import localStorageTypes from 'ut-front-react/components/ResiziblePageLayout/localStorageTypes';
import Text from 'ut-front-react/components/Text';
import mainStyle from 'ut-front-react/assets/index.css';

import Grid from './../../containers/Partners/Grid';
import {ToolboxFilters, ToolboxButtons} from './../../containers/Partners/GridToolbox';
import FilterByCustomSearch from './../../containers/Partners/Filters/ByCustomSearch';
import ClearFilter from './../../containers/Partners/Filters/Clear';

import GridToolboxButtons from './../../containers/Partners/GridToolboxButtons';

import Pagination from './../../containers/Partners/Pagination';
import Details from './../../containers/Partners/Popups/Details';
import PartnerCreate from './../../containers/Partners/Popups/CreatePartner';
import {openCreatePartnerPopup} from './../../containers/Partners/Popups/CreatePartner/actions';

import style from '../style.css';

class Partner extends Component {
    getResizibleCols() {
        let {config} = this.props;
        let filterByCustomSearch = config.getIn(['filters', 'filterByCustomSearch']);
        let content = (
            <div className={mainStyle.contentTableWrap} style={{minWidth: '925px'}}>
                <div className={mainStyle.actionBarWrap}>
                    <ToolboxFilters>
                        <div className={style.filterWrap}>
                            <div className={style.filterCustomSearchSeparated}>
                                <FilterByCustomSearch allowedFields={filterByCustomSearch.get('fields')} defaultField={filterByCustomSearch.get('defaultField')} />
                            </div>
                            <ClearFilter />
                        </div>
                    </ToolboxFilters>
                    <ToolboxButtons>
                        <div className={style.buttonWrap}>
                            <GridToolboxButtons />
                        </div>
                    </ToolboxButtons>
                </div>
                <Grid />
                <Pagination />
            </div>
        );

        let resizibleContainerCols = [
            {type: resizibleTypes.CONTENT, id: 'roleContent', normalWidth: window.window.innerWidth, minWidth: 250, child: content}
        ];

        return resizibleContainerCols;
    }
    getButtons() {
        let buttons = [];
        if (this.context.checkPermission('transfer.partner.add')) {
            buttons.push({text: 'Create Partner', onClick: this.props.openCreatePartnerPopup, styleType: 'primaryLight'});
        }

        return buttons;
    }
    render() {
        let resizibleContainerCols = this.getResizibleCols();
        let buttons = this.getButtons();
        return (
            <div>
                <AddTab pathname={getLink('ut-transfer:partners')} title='Transfer Partners and Card Issuers' />
                <Header text={<Text>Transfer Partners and Card Issuers</Text>} buttons={buttons} />
                <div>
                    <ResizibleContainer cols={resizibleContainerCols} localStorageType={localStorageTypes.TWO_COLS} />
                </div>
                <PartnerCreate />
                <Details />
            </div>
        );
    }
};

Partner.propTypes = {
    config: PropTypes.object,
    openCreatePartnerPopup: PropTypes.func.isRequired
};

Partner.contextTypes = {
    checkPermission: PropTypes.func
};

export default connect(
    (state) => {
        return {
            config: state.transferConfig.get('partners')
        };
    },
    {openCreatePartnerPopup}
)(Partner);
