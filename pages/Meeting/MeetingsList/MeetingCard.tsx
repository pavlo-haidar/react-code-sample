import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Card, Icon } from 'some-ui-library';
import { faMapMarkerAlt, faHome, IconDefinition } from '@fortawesome/pro-solid-svg-icons';

import {
    convertToYearString,
    convertToDayString,
    convertToShortMonthString,
    convertToStandardTime,
    convertToMonthDayYear,
} from 'helpers/datetime';
import {
    MeetingInstanceResponse,
    MeetingTypes,
    MEETING_STATUS_COLORS,
    MEETING_STATUS_TEXT_COLORS,
    MeetingInstanceStatus,
} from 'models/Meeting';
import { getPreferredTimezone } from 'store/redux/selectors';
import { State } from 'store/redux/types';
import { EMPTY_COL_VALUE } from 'models/UI';

import { MeetingCardTypeAndStatus } from './MeetingCardTypeAndStatus';

export enum MeetingCardStyle {
    Full = 'full',
    Compact = 'compact',
}

const MeetingHeading = ({ icon, children }: PropsWithChildren<{ icon?: IconDefinition }>) => (
    <div className="subtitle-sm text-grey-dark">
        {icon && <Icon icon={icon} className="mr-2" />}
        {children}
    </div>
);

const InfoField = ({ label, children }: PropsWithChildren<{ label: string }>) => (
    <div>
        <span className="text-grey-dark mr-3">{label}</span>
        {children}
    </div>
);

const CLASSES = {
    CARD_CLASSES:
        'mb-4 grid grid-cols-12 gap-4 md:gap-6 p-4 md:p-6 cursor-pointer hover:shadow-md hover:bg-grey-xx-light transition-all duration-200',
    DATE_CONTAINER_CLASSES: 'rounded-lg bg-opacity-10 py-5 px-1 text-center',
    DATE_MONTH: 'text-lg font-semibold',
    DATE_DAY: 'text-3xl font-semibold',
};

interface Props {
    meetingInstance: MeetingInstanceResponse;
    style?: MeetingCardStyle;
    meetingInstancesStatus?: MeetingInstanceStatus;
}

export const MeetingCard = ({ meetingInstance, style = MeetingCardStyle.Full, meetingInstancesStatus }: Props) => {
    const { statusFilter } = useSelector((state: State) => state.meetings);
    const preferredTimezone: string = useSelector(getPreferredTimezone);

    const history = useHistory();

    const {
        property,
        borrowers: attendees,
        custom_identifier,
        meeting_type,
        meeting_location,
        close_date,
        notary_name,
        encoded_meeting_guid,
        scheduled_start_time,
        assigned_notary_id,
        assigned_notary_pool_vendor_id,
    } = meetingInstance;
    const statusType = meetingInstancesStatus || statusFilter;
    const dateBgColor = MEETING_STATUS_COLORS[statusType];
    const textColor = MEETING_STATUS_TEXT_COLORS[statusType];
    const isClosingMeeting = meeting_type === MeetingTypes.PropertySigning || meeting_type === MeetingTypes.Ipen;
    const isGenericMeeting = meeting_type === MeetingTypes.GenericSigning;
    const isAcknowledgementMeeting = meeting_type === MeetingTypes.Acknowledgement;
    const hasUnassignedNotaryFromProvider = !!assigned_notary_pool_vendor_id && !assigned_notary_id;

    const handleClick = () => {
        history.push(`/meeting/detail/${encoded_meeting_guid}`);
    };

    if (style === MeetingCardStyle.Compact) {
        return (
            <Card bgColor="white" className={CLASSES.CARD_CLASSES} data-testid="meeting-card" onClick={handleClick}>
                {/* Date */}
                <div className="col-span-3 md:col-span-2">
                    <div
                        className={`flex h-fit flex-col ${CLASSES.DATE_CONTAINER_CLASSES} ${textColor} ${dateBgColor} space-y-1`}
                    >
                        {/* Month */}
                        <div className={CLASSES.DATE_MONTH}>
                            {convertToShortMonthString(scheduled_start_time, preferredTimezone)}
                        </div>
                        {/* Day */}
                        <div className={CLASSES.DATE_DAY}>
                            {convertToDayString(scheduled_start_time, preferredTimezone)}
                        </div>
                        {/* Year */}
                        <div className="text-sm">{convertToYearString(scheduled_start_time, preferredTimezone)}</div>
                    </div>
                </div>

                {/* Meeting details */}
                <div className="col-span-9 md:col-span-10">
                    {/* Time/name/property/meeting type */}
                    <div className="w-full sm:flex flex-row-reverse pb-2">
                        {/* Place and time */}
                        <div className="flex-grow">
                            <div className="flex items-center justify-between">
                                {convertToStandardTime(meetingInstance?.scheduled_start_time, preferredTimezone)}
                                <MeetingCardTypeAndStatus
                                    meetingType={meeting_type}
                                    meeting_status={statusType}
                                    className="mb-3 flex"
                                />
                            </div>
                            {/* Details with icons */}
                            <div className="mt-4">
                                <MeetingHeading icon={faMapMarkerAlt}>{meeting_location || 'Virtual'}</MeetingHeading>
                            </div>

                            <div>
                                {property && !isAcknowledgementMeeting && (
                                    <MeetingHeading icon={faHome}>{property}</MeetingHeading>
                                )}
                                {isGenericMeeting && !!custom_identifier && (
                                    <MeetingHeading>{custom_identifier}</MeetingHeading>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card bgColor="white" className={CLASSES.CARD_CLASSES} data-testid="meeting-card" onClick={handleClick}>
            {/* Date */}
            <div className="col-span-12 sm:col-span-3 md:col-span-2">
                <div className={`${CLASSES.DATE_CONTAINER_CLASSES} ${textColor} ${dateBgColor} grid grid-cols-1 gap-1`}>
                    {/* Month */}
                    <div className={CLASSES.DATE_MONTH}>
                        {convertToShortMonthString(scheduled_start_time, preferredTimezone)}
                    </div>
                    {/* Day */}
                    <div className={CLASSES.DATE_DAY}>
                        {convertToDayString(scheduled_start_time, preferredTimezone)}
                    </div>
                    {/* Year */}
                    <div className="text-sm">{convertToYearString(scheduled_start_time, preferredTimezone)}</div>
                </div>
            </div>

            {/* Meeting details */}
            <div className="col-span-12 sm:col-span-9 md:col-span-10">
                {/* Time/name/property/meeting type */}
                <div className="w-full sm:flex flex-row-reverse pb-4 mb-4 bottom-border">
                    {/* Meeting type/status */}
                    <MeetingCardTypeAndStatus
                        meeting_status={statusType}
                        className="mb-3 flex"
                        meetingType={meeting_type}
                        hasUnassignedNotaryFromProvider={hasUnassignedNotaryFromProvider}
                    />

                    {/* Place and time */}
                    <div className="flex-grow grid grid-cols-1">
                        <div className="subtitle">
                            Begins at {convertToStandardTime(meetingInstance?.scheduled_start_time, preferredTimezone)}
                        </div>
                        {/* Details with icons */}
                        {meeting_location && <MeetingHeading icon={faMapMarkerAlt}>{meeting_location}</MeetingHeading>}
                        {property && !isAcknowledgementMeeting && (
                            <MeetingHeading icon={faHome}>{property}</MeetingHeading>
                        )}
                        {isGenericMeeting && !!custom_identifier && (
                            <MeetingHeading>{custom_identifier}</MeetingHeading>
                        )}
                    </div>
                </div>

                {/* Attendee/Loan details */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Loan number or meeting name
                        If it's a closing meeting, any custom identifier will be a loan number,
                        otherwise it's the meeting name (we reuse that field) */}
                    <InfoField label={isClosingMeeting ? 'Loan number' : 'Meeting name'}>
                        {custom_identifier || EMPTY_COL_VALUE}
                    </InfoField>
                    {/* Attendees
                        Meeting response returns a string of borrowers in all meeting types, even if it's not a closing meeting */}
                    <InfoField label={isClosingMeeting ? 'Borrower(s)' : 'Attendee(s)'}>{attendees}</InfoField>
                    {/* Close date */}
                    {close_date && (
                        <InfoField label={isAcknowledgementMeeting ? 'Date' : 'Closing date'}>
                            {convertToMonthDayYear(close_date)}
                        </InfoField>
                    )}
                    {/* Notary/host */}
                    <InfoField label="Notary">{notary_name}</InfoField>
                </div>
            </div>
        </Card>
    );
};
