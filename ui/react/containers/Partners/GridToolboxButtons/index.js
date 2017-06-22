import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import StandartButton from 'ut-front-react/components/StandardButton';
import {fetchPartnerDetails} from './../Popups/Details/actions';

export class Buttons extends Component {
    constructor(props, context) {
        super(props, context);
        this.fetchPartnerDetails = this.fetchPartnerDetails.bind(this);
    }
    fetchPartnerDetails() {
        this.props.fetchPartnerDetails(this.props.checked.getIn(['0', 'partnerId']));
    }
    render() {
        let disabled = this.props.checked.size !== 1;
        return <div>
            {this.context.checkPermission('transfer.partner.get') && <StandartButton
              disabled={disabled}
              styleType='secondaryDialog'
              onClick={!disabled ? this.fetchPartnerDetails : () => {}}
              label='Details'
            />}
        </div>;
    }
}

Buttons.propTypes = {
    checked: PropTypes.object.isRequired,
    fetchPartnerDetails: PropTypes.func.isRequired
};

Buttons.contextTypes = {
    checkPermission: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    return {
        checked: state.transferPartnersGrid.get('checkedRows').toList()
    };
}
export default connect(
    mapStateToProps,
    {fetchPartnerDetails}
)(Buttons);
