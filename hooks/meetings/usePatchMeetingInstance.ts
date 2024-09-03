import { useMutation } from 'react-query';

import { Meeting } from 'models/Meeting';
import { updateMeetingInstance } from 'api/meeting';

export const usePatchMeetingInstance = () => {
    const { mutate: updateMeetingInstanceMutation, isLoading, isError } = useMutation(updateMeetingInstance);

    const handleUpdateMeetingInstance = ({
        selectedMeetingInstanceHash,
        payload,
        onSuccess,
        onError,
    }: {
        selectedMeetingInstanceHash: string;
        payload: Partial<Meeting>;
        onSuccess: (data: Meeting) => void;
        onError: (error: unknown) => void;
    }) => {
        updateMeetingInstanceMutation(
            { selectedMeetingInstanceHash, payload },
            {
                onSuccess,
                onError,
            },
        );
    };

    return {
        updateMeetingInstance: handleUpdateMeetingInstance,
        isLoading,
        isError,
    };
};
