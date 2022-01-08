import React from 'react';

import { View, Text } from '@tarojs/components'

class Modal extends React.Component {
    constructor(props) {
        super(props);

        let {isOpened} = props
        
        // this.handleClose = (event) => {
        //     if (typeof this.props.onClose === 'function') {
        //         this.props.onClose(event);
        //     }
        // };
        // this.handleCancel = (event) => {
        //     if (typeof this.props.onCancel === 'function') {
        //         this.props.onCancel(event);
        //     }
        // };
        this.handleConfirm = (event) => {
            if (typeof this.props.onConfirm === 'function') {
                this.props.onConfirm(event);
            }
        };
        // this.handleTouchMove = (e) => {
        //     e.stopPropagation();
        // };


        this.state = {
            isOpened: isOpened
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const { isOpened } = nextProps;
        if (isOpened !== this.state.isOpened) {
            this.setState({ isOpened: isOpened });
        }
    }
    
    render() {
        const { isOpened } = this.state;
        const { title, content, cancelText, confirmText } = this.props;


        return (
            <View className={(isOpened)?"g-modal act":"g-modal"}>
                <View className="m-wrap">
                    <View className="m-title">{title}</View>
                    <View className="m-content">{content}</View>
                    <View className="m-btn" onClick={this.handleConfirm}>
                         {confirmText}
                    </View>
                </View>
                
            </View>
        )
        
    }
}

export default Modal
