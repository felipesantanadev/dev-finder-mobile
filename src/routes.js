import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';   

import Map from './pages/Map';
import Profile from './pages/Profile';

const Routes = createAppContainer(
    createStackNavigator({
        Map: {
            screen: Map,
            navigationOptions: {
                title: 'Dev Radar'
            }
        },
        Profile: {
            screen: Profile,
            navigationOptions: {
                title: 'Perfil do Github'
            }
        }
    }, {
        defaultNavigationOptions: {
            headerStyle: {
                backgroundColor: '#7D40E7'
            },
            headerTintColor: '#FFF',
            headerBackTitleVisible: false
        }
    })
)

export default Routes;