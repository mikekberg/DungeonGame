/// <reference path="../Libraries/jquery-1.6.2.js" />

var AI = {
    "EnemyDefault": { 
                     Init: function(enemy, config) {
                         config = config || {};
                         enemy.AI_vars = {};
                         enemy.AI_vars.nextActionMSMin = config.nextActionMin || 700;
                         enemy.AI_vars.nextActionMSMax = config.nextActionMax || 4000;
                         enemy.AI_vars.waitWeighting = config.waitWeighting || 0.30;
                         enemy.AI_vars.timeCounter = 0;
                         enemy.AI_vars.nextAction = this.GetNextActionTime(enemy);
                      },
                      UpdateAI: function(enemy, elapseTime) { 
                         enemy.AI_vars.timeCounter += elapseTime;
                         
                         if (enemy.AI_vars.timeCounter >= enemy.AI_vars.nextAction) {
                            if (Math.random() <= enemy.AI_vars.waitWeighting) {
                                enemy.sprite.StopWalking();
                            }
                            else {
                                enemy.sprite.StartWalking([1,2,3,4,6,7,8,9][Math.floor(Math.random() * 8)]);
                            }
                            
                            enemy.AI_vars.timeCounter = 0;
                            enemy.AI_vars.nextAction = this.GetNextActionTime(enemy);
                         }
                         
                      },
                      GetNextActionTime: function(enemy) {
                        return (Math.random() * (enemy.AI_vars.nextActionMSMax - enemy.AI_vars.nextActionMSMin)) + enemy.AI_vars.nextActionMSMin;
                      }
                    }
}