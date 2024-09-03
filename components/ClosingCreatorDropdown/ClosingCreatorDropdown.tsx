import React, { useEffect, useMemo } from 'react';
import { Select } from 'some-ui-library';
import type { Option } from 'some-ui-library';
import { useDispatch } from 'react-redux';
import { useQuery } from 'react-query';

import { updateCreatorFilter } from 'store/redux/meetings/actions';
import { useLoggedInUser } from 'hooks/users/useLoggedInUser';
import { getNotaries } from 'api/meeting';
import { QueryKeys, QueryStaleTime } from 'constants/queryOptions';

interface Props {
    hideLabel?: boolean;
    selectedValues: number[];
    onSelect: (val: number[]) => void;
}

export const ClosingCreatorDropdown = ({ hideLabel, selectedValues, onSelect }: Props) => {
    const dispatch = useDispatch();
    const { loggedInUser } = useLoggedInUser();
    const { email, id: userNotaryId, name } = loggedInUser;

    const { data: notaryData, isLoading: isGetNotariesLoading } = useQuery({
        queryKey: [QueryKeys.FetchNotaries],
        queryFn: () => getNotaries(),
        staleTime: QueryStaleTime.FiveMinutes,
    });

    const loggedInUserOption = useMemo(() => {
        return {
            value: userNotaryId,
            label: 'My Meetings',
            isDisabled: true,
            display: () => (
                <>
                    {name}
                    <br />
                    <span className="text-xs text-grey-dark">{email}</span>
                </>
            ),
        };
    }, [loggedInUser]);

    const options = useMemo(() => {
        return (notaryData || []).reduce(
            (arr: Option[], item) => {
                if (item.id !== userNotaryId) {
                    arr.push({
                        value: item.id,
                        label: `${item.name} (${item.email})`,
                        display: () => (
                            <>
                                {item.name}
                                <br />
                                <span className="text-xs text-grey-dark">{item.email}</span>
                            </>
                        ),
                    });
                }
                return arr;
            },
            [loggedInUserOption],
        );
    }, [notaryData, loggedInUserOption]);

    const dropdownChange = (values: Option[]) => {
        const notaryIds = values?.map(v => v.value);
        onSelect(notaryIds);
    };

    useEffect(() => {
        dispatch(updateCreatorFilter([userNotaryId]));
    }, [userNotaryId]);

    return (
        <div style={{ width: '300px' }}>
            <Select
                label={hideLabel ? '' : 'Filter by notary'}
                onSelect={dropdownChange}
                options={options}
                canSearch
                isMultiSelect
                width="full"
                showSelectAllOption
                placeholder="My meetings"
                selectedValues={selectedValues}
                isDisabled={isGetNotariesLoading}
            />
        </div>
    );
};
