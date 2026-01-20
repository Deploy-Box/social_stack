import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
    Feed: undefined;
    Messages: undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    Main: NavigatorScreenParams<BottomTabParamList>;
    ChatScreen: { conversationId: string };
    LoginScreen: undefined;
};
