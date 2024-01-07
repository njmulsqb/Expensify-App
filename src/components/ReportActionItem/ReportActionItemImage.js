import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import AttachmentModal from '@components/AttachmentModal';
import EReceiptThumbnail from '@components/EReceiptThumbnail';
import Image from '@components/Image';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import ThumbnailImage from '@components/ThumbnailImage';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';

const propTypes = {
    /** thumbnail URI for the image */
    thumbnail: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /** URI for the image or local numeric reference for the image  */
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

    /** whether or not to enable the image preview modal */
    enablePreviewModal: PropTypes.bool,

    /* The transaction associated with this image, if any. Passed for handling eReceipts. */
    transaction: transactionPropTypes,

    /** whether thumbnail is refer the local file or not */
    isLocalFile: PropTypes.bool,

    /** whether the receipt can be replaced */
    canEditReceipt: PropTypes.bool,
};

const defaultProps = {
    thumbnail: null,
    transaction: {},
    enablePreviewModal: false,
    isLocalFile: false,
    canEditReceipt: false,
};

/**
 * An image with an optional thumbnail that fills its parent container. If the thumbnail is passed,
 * we try to resolve both the image and thumbnail from the API. Similar to ImageRenderer, we show
 * and optional preview modal as well.
 */

function ReportActionItemImage({thumbnail, image, enablePreviewModal, transaction, canEditReceipt, isLocalFile}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const imageSource = tryResolveUrlFromApiRoot(image || '');
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail || '');
    const isEReceipt = !_.isEmpty(transaction) && TransactionUtils.hasEReceipt(transaction);

    let receiptImageComponent;

    if (isEReceipt) {
        receiptImageComponent = (
            <View style={[styles.w100, styles.h100]}>
                <EReceiptThumbnail transactionID={transaction.transactionID} />
            </View>
        );
    } else if (thumbnail && !isLocalFile && !Str.isPDF(imageSource)) {
        receiptImageComponent = (
            <ThumbnailImage
                previewSourceURL={thumbnailSource}
                style={[styles.w100, styles.h100]}
                isAuthTokenRequired
                shouldDynamicallyResize={false}
            />
        );
    } else {
        receiptImageComponent = (
            <Image
                source={{uri: thumbnail || image}}
                style={[styles.w100, styles.h100]}
            />
        );
    }

    if (enablePreviewModal) {
        return (
            <ShowContextMenuContext.Consumer>
                {({report}) => (
                    <AttachmentModal
                        source={imageSource}
                        isAuthTokenRequired={!isLocalFile}
                        report={report}
                        isReceiptAttachment
                        canEditReceipt={canEditReceipt}
                        allowToDownload
                        originalFileName={transaction.filename}
                    >
                        {({show}) => (
                            <PressableWithoutFocus
                                style={[styles.noOutline, styles.w100, styles.h100]}
                                onPress={show}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                                accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                            >
                                {receiptImageComponent}
                            </PressableWithoutFocus>
                        )}
                    </AttachmentModal>
                )}
            </ShowContextMenuContext.Consumer>
        );
    }

    return receiptImageComponent;
}

ReportActionItemImage.propTypes = propTypes;
ReportActionItemImage.defaultProps = defaultProps;
ReportActionItemImage.displayName = 'ReportActionItemImage';

export default ReportActionItemImage;
