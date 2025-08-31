/**
 * AgentKit Service
 * Handles interaction with the agentkit index.ts script
 */

const { spawn } = require('child_process');
const path = require('path');

class AgentKitService {
  constructor() {
    this.agentKitPath = path.join(__dirname, '..', 'agentkit');
  }
  
  /**
   * Process a message through AgentKit
   * @param {string} message - The user message to process
   * @returns {Promise<string>} - The response from the agent
   */
  async processMessage(message) {
    console.log(`Processing message with AgentKit: "${message}"`);
    
    return new Promise((resolve, reject) => {
      try {
        // First try with ts-node
        console.log('Trying to run with ts-node...');
        const child = spawn('ts-node', ['index.ts', message], {
          cwd: this.agentKitPath,
          shell: true
        });
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
          const chunk = data.toString();
          output += chunk;
          console.log(`AgentKit stdout: ${chunk}`);
        });
        
        child.stderr.on('data', (data) => {
          const chunk = data.toString();
          errorOutput += chunk;
          console.error(`AgentKit stderr: ${chunk}`);
        });
        
        child.on('error', (error) => {
          console.error('Failed to start ts-node process:', error);
          // Try with node as fallback
          this.runWithNode(message)
            .then(resolve)
            .catch(reject);
        });
        
        child.on('close', (code) => {
          console.log(`AgentKit process exited with code ${code}`);
          
          if (code !== 0) {
            console.error(`AgentKit error: ${errorOutput}`);
            
            // Check if the error is due to ts-node not being found
            if (errorOutput.includes('ts-node: command not found') ||
                errorOutput.includes('\'ts-node\' is not recognized')) {
              console.log('ts-node not found, falling back to node...');
              this.runWithNode(message)
                .then(resolve)
                .catch(reject);
              return;
            }
            
            // Even if there's an error, try to return whatever output we got
            if (output.trim()) {
              resolve(output.trim());
            } else {
              reject(new Error(`AgentKit process failed: ${errorOutput || 'Unknown error'}`));
            }
          } else {
            resolve(output.trim());
          }
        });
      } catch (error) {
        console.error('Failed to spawn AgentKit process:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Fallback method to run with node
   * @param {string} message - The message to process
   * @returns {Promise<string>} The response from the agent
   */
  async runWithNode(message) {
    return new Promise((resolve, reject) => {
      console.log('Falling back to node...');
      const nodeProcess = spawn('node', ['index.js', message], {
        cwd: this.agentKitPath,
        shell: true
      });
      
      let output = '';
      let errorOutput = '';
      
      nodeProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        console.log(`Node AgentKit stdout: ${chunk}`);
      });
      
      nodeProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        console.error(`Node AgentKit stderr: ${chunk}`);
      });
      
      nodeProcess.on('error', (error) => {
        reject(error);
      });
      
      nodeProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Node process failed with code ${code}: ${errorOutput}`);
          if (output.trim()) {
            resolve(output.trim());
          } else {
            reject(new Error(`Node AgentKit process failed: ${errorOutput || 'Unknown error'}`));
          }
        } else {
          resolve(output.trim());
        }
      });
    });
  }
}

module.exports = new AgentKitService();
