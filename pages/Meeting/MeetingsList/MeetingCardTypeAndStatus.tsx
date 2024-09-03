import React from 'react';
import { Badge, BadgeColor, Icon, IconSize } from 'some-ui-library';
import { faStamp } from '@fortawesome/pro-solid-svg-icons';

import { MeetingInstanceStatus, MeetingTypes } from 'models/Meeting';
import { Status } from 'components/Pill/Presets/Status';

interface Props {
    meetingType: MeetingTypes;
    className?: string;
    hasUnassignedNotaryFromProvider?: boolean;
    meeting_status?: MeetingInstanceStatus;
}

export const MeetingCardTypeAndStatus = ({
    meetingType,
    meeting_status,
    className,
    hasUnassignedNotaryFromProvider = false,
}: Props) => {
    const isClosingMeeting = meetingType === MeetingTypes.PropertySigning || meetingType === MeetingTypes.Ipen;
    const isAcknowledgementMeeting = meetingType === MeetingTypes.Acknowledgement;

    const getColor = (status: MeetingInstanceStatus | undefined) => {
        switch (status) {
            case 'upcoming': {
                return BadgeColor.Info;
            }
            case 'cancelled': {
                return BadgeColor.Warning;
            }
            case 'completed': {
                return BadgeColor.Success;
            }
        }
    };

    const color = getColor(meeting_status);

    return (
        <div className={className}>
            {meetingType === MeetingTypes.Ipen && (
                <Badge className="mr-2" color={BadgeColor.Secondary}>
                    IPEN
                </Badge>
            )}
            {meeting_status && <Status badgeColor={color} containerClassName="mr-2" status={meeting_status} />}
            <Badge color={BadgeColor.Grey}>
                {isClosingMeeting ? 'Closing' : isAcknowledgementMeeting ? 'Acknowledgement' : 'Generic signing'}
            </Badge>
            {hasUnassignedNotaryFromProvider && (
                <Badge className="ml-2" color={BadgeColor.Warning}>
                    <Icon className="mr-1" color="warning" icon={faStamp} size={IconSize.xs} />
                    Unassigned
                </Badge>
            )}
        </div>
    );
};
