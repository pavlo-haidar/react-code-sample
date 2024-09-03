import { useMutation } from 'react-query';
import type { AxiosResponse } from 'axios';

import { formatMeetingDraft } from 'pages/Create/Meeting/helpers';
import { CreateMeetingPayload, ResponseCreateMeeting } from 'models/Meeting';
import { createMeeting } from 'api/meeting';
import { MeetingDraftState } from 'store/redux/meetingDraft/reducers';

interface CreateFunctionParams {
    meetingDraft: MeetingDraftState;
    fileId?: number;
    onSuccess: (data: AxiosResponse<ResponseCreateMeeting>) => void;
    onError: (error: unknown) => void;
}

export const useCreateMeeting = () => {
    const getPayload = meetingDraft => {
        return formatMeetingDraft(meetingDraft) as CreateMeetingPayload;
    };

    const { mutate: createMeetingMutation, isLoading, isError } = useMutation(createMeeting);

    const handleCreateMeeting = ({ meetingDraft, fileId, onSuccess, onError }: CreateFunctionParams) => {
        const payload = getPayload(meetingDraft);

        createMeetingMutation(
            { payload, fileId },
            {
                onSuccess,
                onError,
            },
        );
    };

    return {
        createMeeting: handleCreateMeeting,
        isLoading,
        isError,
    };
};
