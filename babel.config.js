module.exports = {
    presets: ['babel-preset-expo'],
    env: {
        production: {
            plugins: ['transform-remove-console'],
        },
    },
    plugins: [
        'react-native-reanimated/plugin',
    ],
};