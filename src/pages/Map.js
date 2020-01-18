import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

import api from '../services/api';
import { connect, disconnect, subscribeToNewDevelopers } from '../services/socket';

const Map = ({ navigation }) => {
    const [coordinates, setCoordinates] = useState(null);
    const [developers, setDevelopers] = useState([]);
    const [textSearch, setTextSearch] = useState('');

    useEffect(() => {
        async function loadInitialPosition() {
            const { granted } = await requestPermissionsAsync();

            if (granted) {
                const location = await getCurrentPositionAsync({
                    enableHighAccuracy: true
                });

                const { latitude, longitude } = location.coords;
                setCoordinates({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04
                });
            }
        }

        loadInitialPosition();
    }, []);

    useEffect(() => {
        subscribeToNewDevelopers(newDev => setDevelopers([...developers, newDev]));
    }, [developers]);

    if (!coordinates) {
        return null;
    }

    const handleRegionChange = (region) => {
        setCoordinates(region);
    }

    const loadDevs = async () => {
        const { latitude, longitude } = coordinates;
        
        const response = await api.get('/search', {
            params: {
                latitude,
                longitude,
                techs: textSearch
            }
        });

        if (response.status == 200) {
            setDevelopers(response.data);
            setupWebSocket();
        }
    }

    const setupWebSocket = () => {
        const { latitude, longitude } = coordinates;
        connect(latitude,  longitude, textSearch);
    }

    return (
        <>
            <MapView onRegionChangeComplete={handleRegionChange} initialRegion={coordinates} style={styles.map}>
                {
                    developers.map(developer => (
                        <Marker key={developer._id} coordinate={{ latitude: developer.location.coordinates[1], 
                                              longitude: developer.location.coordinates[0] }}>
                            <Image style={styles.mapPin} source={{ uri: developer.avatar_url }} />
                            <Callout onPress={() => navigation.navigate('Profile', {  github_username: developer.github_username })}>
                                <View style={styles.callout}>
                                    <Text style={styles.devName}>{developer.name}</Text>
                                    <Text style={styles.devBio}>{developer.bio}</Text>
                                    <Text style={styles.devTechs}>{developer.techs.join(', ')}</Text>
                                </View>
                            </Callout>
                        </Marker>
                    ))
                }
            </MapView>
            <View style={styles.searchForm}>
                <TextInput style={styles.searchInput}
                    placeholder="Search devs by technologies"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                    onChangeText={setTextSearch} />
                <TouchableOpacity onPress={loadDevs} style={styles.searchButton}>
                    <MaterialIcons name="my-location" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
    mapPin: {
        width: 54,
        height: 54,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#FFF'
    },
    callout: {
        width: 250
    },
    devName: {
        fontWeight: 'bold',
        fontSize: 16
    },
    devBio: {
        color: '#666666',
        marginTop: 5
    },
    devTechs: {
        marginTop: 5
    },
    searchForm: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 2,
        flexDirection: 'row'
    },
    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#FFF',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4
        },
        elevation: 2
    },
    searchButton: {
        width: 50,
        height: 50,
        backgroundColor: '#8E4DFF',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15
    }
})

export default Map;