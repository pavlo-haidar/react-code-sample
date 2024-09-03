import { useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { usePagination, useAlerts } from 'some-ui-library';

import { QueryKeys, QueryStaleTime } from 'constants/queryOptions';
import { getMeetingsList } from 'api/meeting';
import { useLoggedInUser } from 'hooks/users/useLoggedInUser';
import { MeetingsListPayload } from 'models/Meeting';
import { usePageFilterOptions } from 'hooks/ui/usePageFilterOptions';

const PAGE_SIZE = 10;

export const useMeetingsList = () => {
    const { pageFilterOptionsState, updateFilterValue } = usePageFilterOptions();

    const { addToast } = useAlerts();
    const { loggedInUserId: userId } = useLoggedInUser();

    const selectedFilters: MeetingsListPayload = useMemo(
        () => ({
            status: pageFilterOptionsState.status || 'upcoming',
            notaryIds: pageFilterOptionsState.notaryIds || (userId ? [userId] : []),
            offset: pageFilterOptionsState.offset || 0,
            limit: PAGE_SIZE,
            searchTerm: pageFilterOptionsState.searchTerm || '',
        }),
        [pageFilterOptionsState],
    );

    const currentPage = useMemo(
        () => (pageFilterOptionsState.offset || 0) / PAGE_SIZE + 1,
        [pageFilterOptionsState.offset],
    );

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch: refetchMeetingList,
    } = useQuery([QueryKeys.FetchMeetingsList, selectedFilters], () => getMeetingsList(selectedFilters), {
        staleTime: QueryStaleTime.ThirtySeconds,
        enabled: selectedFilters?.notaryIds?.length > 0,
        onError: err => {
            console.error(err);
            addToast('There was an error fetching your meetings.', { appearance: 'warning' });
        },
    });

    const { meetings = [], count = 0 } = data || {};

    const { totalPageCount } = usePagination({
        itemsPerPage: PAGE_SIZE,
        totalItems: count,
        selectedPage: currentPage,
    });

    const selectPage = (page: number) => {
        updateFilterValue({ ...pageFilterOptionsState, offset: (page - 1) * PAGE_SIZE });
    };

    const updateFilterFields = (newValues: Partial<MeetingsListPayload>) => {
        updateFilterValue({ ...pageFilterOptionsState, ...newValues });
    };

    useEffect(() => {
        if (userId && !pageFilterOptionsState.notaryIds) {
            updateFilterFields({ notaryIds: [userId] });
        }
    }, [userId]);

    return {
        meetings,
        count,
        currentPage,
        totalPageCount,
        isLoading,
        isFetching,
        isError,
        selectedFilters,
        refetchMeetingList,
        selectPage,
        updateFilterFields,
    };
};
