import Server from './Server';

const main = async () => {
  await Server.initialize();
};

main().catch(console.error);