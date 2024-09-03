import React, { Fragment, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import { LoadingContainer, Pager, Button, ButtonVariant, ButtonSize, useModal } from 'some-ui-library';
import { faSync } from '@fortawesome/pro-regular-svg-icons';

import { ClosingCreatorDropdown } from 'components/ClosingCreatorDropdown/ClosingCreatorDropdown';
import { ListViewPage } from 'components/Layout/ListViewPage/ListViewPage';
import { ListViewContent } from 'components/Layout/ListViewPage/ListViewContent';
import { EmptyState } from 'components/EmptyState/EmptyState';
import { MeetingInstanceStatus, MeetingInstanceResponse, MEETING_STATUS_TABS } from 'models/Meeting';
import { State } from 'store/redux/types';
import { useMeetingsList } from 'hooks/meetings/useMeetingsList';
import meetingsMultiIcon from 'assets/images/meetings-multi.svg';
import { getDateTimeWithPreferredTimezone } from 'helpers/datetime';
import { getPreferredTimezone } from 'store/redux/selectors';
import { useMeetingCounts } from 'hooks/meetings/useMeetingCounts';
import { CreateNewModal } from 'components/Modals/CreateNewModal/CreateNewModal';
import { useLoggedInUser } from 'hooks/users/useLoggedInUser';

import { MeetingCard } from './MeetingCard';

import './MeetingsList.css';

const getDateDisplay = (date: string) => {
    const dt = DateTime.fromISO(date);
    if (dt.hasSame(DateTime.local(), 'day')) {
        return 'Today';
    }
    if (dt.hasSame(DateTime.local().plus({ days: 1 }), 'day')) {
        return 'Tomorrow';
    }
    return dt.toLocaleString({ month: 'long', day: 'numeric' });
};

export const MeetingsList = () => {
    const preferredTimezone = useSelector(getPreferredTimezone);

    const { creatorFilter } = useSelector((state: State) => state.meetings);
    const { meetingCountsData } = useMeetingCounts({ notaryIds: creatorFilter });
    const { isLoggedInUserAdmin } = useLoggedInUser();
    const { openModal } = useModal();

    const tabs = useMemo(() => {
        return Object.entries(MEETING_STATUS_TABS).map(([key, val]) => {
            return {
                label: val,
                count: meetingCountsData[key],
                id: key,
            };
        });
    }, [meetingCountsData]);

    const {
        meetings,
        currentPage,
        totalPageCount,
        isLoading,
        isFetching,
        isError,
        selectedFilters,
        refetchMeetingList,
        selectPage,
        updateFilterFields,
    } = useMeetingsList();

    const meetingsByDate: Record<string, MeetingInstanceResponse[]> = useMemo(
        () =>
            meetings.reduce((acc, meeting) => {
                const { scheduled_start_time } = meeting;
                // Cut out date and time to plain ISO date string YYYY-MM-DD
                const startDate = getDateTimeWithPreferredTimezone(scheduled_start_time, preferredTimezone).toISODate();
                if (startDate) {
                    if (!acc[startDate]) {
                        acc[startDate] = [];
                    }
                    acc[startDate].push(meeting);
                }
                return acc;
            }, {} as Record<string, MeetingInstanceResponse[]>),
        [meetings],
    );

    // Handlers
    const launchModal = () => {
        openModal(CreateNewModal, { isCreateNewMeeting: true });
    };

    return (
        <ListViewPage
            heading="Meetings"
            createNewButton={{
                text: 'Create meeting',
                onClick: launchModal,
                testid: 'create-meeting-btn',
            }}
            tabs={{
                tabs,
                activeTabId: selectedFilters.status,
                onSelectTab: ({ id }) => {
                    updateFilterFields({
                        status: id as MeetingInstanceStatus,
                        offset: 0,
                    });
                },
            }}
            testid="MeetingsList-Page"
        >
            <ListViewContent
                isLoading={isLoading}
                filters={
                    isLoggedInUserAdmin ? (
                        <ClosingCreatorDropdown
                            hideLabel
                            selectedValues={selectedFilters.notaryIds}
                            onSelect={val => {
                                updateFilterFields({
                                    notaryIds: val,
                                });
                            }}
                        />
                    ) : undefined
                }
                searchTerm={selectedFilters.searchTerm}
                onSearch={value => {
                    updateFilterFields({
                        searchTerm: value,
                    });
                }}
            >
                <LoadingContainer isLoadingComplete={!isLoading} shouldCenter>
                    {isError ? (
                        <div className="w-full p-6 bg-brand-secondary-light bg-opacity-10 text-center">
                            <p>Failed to load data, please try again.</p>
                            <Button
                                variant={ButtonVariant.Outline}
                                size={ButtonSize.Small}
                                icon={faSync}
                                iconAlign="left"
                                onClick={refetchMeetingList}
                                isLoading={isFetching}
                            >
                                Refresh
                            </Button>
                        </div>
                    ) : meetings.length === 0 ? (
                        <EmptyState title="No meetings scheduled" imgUrl={meetingsMultiIcon} />
                    ) : (
                        <>
                            {Object.entries(meetingsByDate).map(([date, meetings]) => (
                                <Fragment key={date}>
                                    {/* Only show date designations for upcoming meetings */}
                                    {selectedFilters.status === MeetingInstanceStatus.Upcoming && (
                                        <div className="meetings-list-date-divider flex items-center justify-between relative pt-4 mb-8">
                                            <div className="text-center subtitle px-8">{getDateDisplay(date)}</div>
                                        </div>
                                    )}
                                    {meetings.map(meeting => (
                                        <div key={meeting.id} className="mb-4">
                                            <MeetingCard
                                                meetingInstance={meeting}
                                                meetingInstancesStatus={selectedFilters.status}
                                            />
                                        </div>
                                    ))}
                                </Fragment>
                            ))}
                            {/* Pager */}
                            <Pager currentPage={currentPage} totalPageCount={totalPageCount} onSetPage={selectPage} />
                        </>
                    )}
                </LoadingContainer>
            </ListViewContent>
        </ListViewPage>
    );
};
