import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import Input from 'ut-front-react/components/Input';
import Checkbox from 'ut-front-react/components/Input/Checkbox';
import Popup from 'ut-front-react/components/Popup';

import {show} from '../Batch/GridToolbox/actions';
import * as actionCreators from './actions';

import style from './style.css';

let UploadForm = React.createClass({
    propTypes: {
        onClose: PropTypes.func,
        actions: PropTypes.object,
        batch: PropTypes.object,
        show: PropTypes.func
    },
    defaultProps: {
        onClose: () => {}
    },
    getInitialState() {
        return {
            result: {},
            fileName: '',
            batchName: this.props.batch ? this.props.batch.name : '',
            checkBatch: true
        };
    },
    onClose() {
        this.props.onClose(!this.canUpload());
    },
    onSubmit(e) {
        e.preventDefault();
        var file = this.refs.batch.files[0];
        var name = this.state.batchName;
        var checkBatch = this.state.checkBatch;
        if (!name) {
            return this.setState({
                result: new Error('Batch Name not specified')
            });
        } else if (!file) {
            return this.setState({
                result: new Error('No file chosen')
            });
        }
        var data = new window.FormData();
        data.append('file', file);
        data.append('name', name);
        if (this.props.batch) {
            data.append('batchId', this.props.batch.batchId);
        }
        if (checkBatch) {
            data.append('checkBatch', checkBatch);
        }
        data.processData = false;
        data.contentType = false;
        var xhr = new window.XMLHttpRequest();
        xhr.open(this.props.batch ? 'PUT' : 'POST', '/rpc/batch', true);
        // xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        xhr.onload = (e) => {
            this.props.actions.hidePreload();
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.response);
                this.setState({
                    result: {message: 'Successfully uploaded ' + response.insertedRows + ' entities'}
                });
            } else {
                this.setState({result: new Error(xhr.response)});
            }
        };
        xhr.send(data);
        this.props.actions.showPreload();
        this.props.show('filters');
    },
    getActionButtons() {
        let buttons = [];
        if (!this.canUpload()) {
            buttons.push({
                label: 'Close',
                onClick: this.onClose,
                className: ['defaultBtn']
            });
        } else {
            buttons.push({
                label: 'Upload',
                type: 'submit',
                onClick: this.onSubmit,
                className: ['defaultBtn']
            }, {
                label: 'Cancel',
                onClick: this.onClose,
                className: ['defaultBtn']
            });
        }
        return buttons;
    },
    canUpload() {
        return !this.state.result.message || this.state.result instanceof Error;
    },
    getFormBody() {
        if (this.canUpload()) {
            let nameOnChange = (result) => {
                this.setState({batchName: result.value});
            };
            let batchOnChange = () => {
                this.setState({fileName: this.refs.batch.files[0].name});
            };
            let checkBatchToggle = () => {
                this.setState({checkBatch: !this.state.checkBatch});
            };
            return (
                <div className={style.fileInput}>
                    <Input value={this.state.batchName} type='text' name='name' label='Batch Name' onChange={nameOnChange} />
                    <div className={style.infoInputWrapper}>
                            <Input value={this.state.fileName} readonly label='Upload Batch' inputWrapClassName={style.inputWrapClassName} />
                    </div>
                    <div className={style.buttonsWrapper}>
                        <div className={style.buttonsInnerWrapper}>
                            <label htmlFor='batch' className={style.browseBtn}>Browse...</label>
                            <input ref='batch' type='file' name='batch' id='batch' accept='text/csv' onChange={batchOnChange} />
                        </div>
                    </div>
                    <div className={style.infoInputWrapper}>
                        <Checkbox label='Check batch after upload' checked={this.state.checkBatch} onClick={checkBatchToggle} />
                    </div>
                </div>
            );
        }
        return null;
    },
    getMessage() {
        let result = this.state.result;
        if (result.message) {
            return (
              <div className={result instanceof Error ? style.errorMessage : style.successMessage}>{result.message}</div>
            );
        }
        return null;
    },
    render() {
        return (
            <Popup
              hasOverlay
              isOpen
              closeOnOverlayClick
              header={{
                  text: 'Upload Batch Payment',
                  closePopup: this.onClose
              }}
              footer={{
                  className: style.footer,
                  actionButtons: this.getActionButtons()
              }}
              closePopup={this.onClose}
            >
                <div className={style.uploadForm}>
                    {this.getFormBody()}
                    {this.getMessage()}
                </div>
            </Popup>
        );
    }
});

export default connect(
    (state, ownProps) => {
        return {};
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(actionCreators, dispatch),
            show: bindActionCreators(show, dispatch)
        };
    }
)(UploadForm);
